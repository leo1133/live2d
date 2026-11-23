#!/usr/bin/env node

/**
 * Script phân tích thay đổi (Git Diff) để xác định phạm vi test tối ưu cho Pull Request
 * Usage: node scripts/detect-pr-tests.js [baseBranch]
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const baseBranch = process.argv[2] || "origin/main";

function getChangedFiles() {
  if (process.env.CHANGED_FILES_OVERRIDE) {
    return process.env.CHANGED_FILES_OVERRIDE.split(",").map((f) => f.trim()).filter(Boolean);
  }
  try {
    const diffOutput = execSync(`git diff --name-only ${baseBranch}...HEAD`, {
      encoding: "utf-8",
    });
    return diffOutput
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch (error) {
    console.warn(`[WARN] Không thể lấy git diff với ${baseBranch}:`, error.message);
    return [];
  }
}

function resolveTests() {
  const changedFiles = getChangedFiles();
  console.log(`[INFO] Số file thay đổi so với ${baseBranch}: ${changedFiles.length}`);

  if (changedFiles.length === 0) {
    return { mode: "SKIP", files: [], reason: "Không có file nào thay đổi" };
  }

  // 1. Kiểm tra xem có phải chỉ thay đổi tài liệu, ảnh, cấu hình git hay không
  const isDocOrMetaOnly = changedFiles.every((file) =>
    /^(docs\/|\.github\/ISSUE_TEMPLATE\/|\.vscode\/|.*\.md$|.*\.png$|.*\.jpg$|.*\.jpeg$|.*\.webp$|.*\.svg$|\.gitignore$|LICENSE$)/i.test(file)
  );
  if (isDocOrMetaOnly) {
    return { mode: "SKIP", files: [], reason: "Chỉ thay đổi tài liệu / hình ảnh / meta" };
  }

  // 2. Kiểm tra xem có thay đổi file core/hạ tầng hay không
  const isCoreInfrastructureChanged = changedFiles.some((file) =>
    /^(src\/fixtures\/|src\/config\/|package\.json|package-lock\.json|playwright\.config\.js|\.env.*)/i.test(file)
  );
  if (isCoreInfrastructureChanged) {
    return {
      mode: "SMOKE",
      files: [
        "tests/api/aa000.api.spec.js",
        "tests/ui/aa000.ui.spec.js",
        "tests/ui/ad100.ui.spec.js",
      ],
      reason: "Thay đổi file cốt lõi/hạ tầng dùng chung -> Chạy Smoke Test Suite",
    };
  }

  // 3. Trích xuất test files và modules từ file thay đổi
  const targetTestFiles = new Set();
  const detectedModules = new Set();

  for (const file of changedFiles) {
    // Nếu trực tiếp sửa file spec
    if (file.startsWith("tests/") && file.endsWith(".spec.js")) {
      if (fs.existsSync(file)) targetTestFiles.add(file);
      continue;
    }

    // Nếu sửa file trong src/pages, src/api, src/test-data
    if (file.startsWith("src/pages/") || file.startsWith("src/api/") || file.startsWith("src/test-data/")) {
      const baseName = path.basename(file, path.extname(file));
      const cleanName = baseName
        .replace(/^(api)/i, "")
        .replace(/(Page|API|Data)$/i, "")
        .toLowerCase();

      if (cleanName && !["common", "index", "assets", "csv"].includes(cleanName)) {
        detectedModules.add(cleanName);
      }
    }
  }

  // Quét các test file tương ứng với module
  for (const mod of detectedModules) {
    const candidateDirs = ["tests/api", "tests/ui", "tests/e2e"];
    for (const dir of candidateDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const f of files) {
          if (f.toLowerCase().includes(mod) && f.endsWith(".spec.js")) {
            targetTestFiles.add(path.join(dir, f));
          }
        }
      }
    }
  }

  const resultFiles = Array.from(targetTestFiles);
  if (resultFiles.length > 0) {
    return {
      mode: "TARGETED",
      files: resultFiles,
      reason: `Phát hiện ${resultFiles.length} file test liên quan đến các module thay đổi: ${Array.from(detectedModules).join(", ")}`,
    };
  }

  // Fallback: Chạy Smoke Suite
  return {
    mode: "SMOKE",
    files: [
      "tests/api/aa000.api.spec.js",
      "tests/ui/aa000.ui.spec.js",
      "tests/ui/ad100.ui.spec.js",
    ],
    reason: "Không xác định được module kiểm thử cụ thể -> Chạy Smoke Test Suite",
  };
}

const result = resolveTests();
console.log(`[RESULT] Mode: ${result.mode}`);
console.log(`[RESULT] Lý do: ${result.reason}`);
if (result.files.length > 0) {
  console.log(`[RESULT] Danh sách test: ${result.files.join(" ")}`);
}

// Xuất kết quả cho GitHub Actions env
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `test_mode=${result.mode}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `test_files=${result.files.join(" ")}\n`);
}
