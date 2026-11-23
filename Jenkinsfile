pipeline {
    agent any

    parameters {
        choice(name: 'SUITE', choices: ['all', 'ad100', 'gacha-limited', 'api', 'ui', 'e2e'], description: 'Chọn bộ kiểm thử muốn thực thi (Mặc định: Toàn bộ testcase)')
        choice(name: 'ENV', choices: ['dev', 'staging'], description: 'Chọn môi trường kiểm thử')
        string(name: 'WORKERS', defaultValue: '2', description: 'Số luồng chạy đồng thời (workers)')
    }

    environment {
        CI = 'true'
        ENV = "${params.ENV ?: 'dev'}"
        WORKERS = "${params.WORKERS ?: '2'}"
        PATH = "/usr/local/bin:/opt/homebrew/bin:$PATH"
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('Check Node Environment') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Prepare Environment') {
            steps {
                sh '''
                if [ ! -f .env.dev ]; then
                    if [ -f /Users/ngaphuong/.jenkins/.env.dev ]; then
                        cp /Users/ngaphuong/.jenkins/.env.dev .env.dev
                    elif [ -f /Users/ngaphuong/.jenkins/workspace/live2d-pipeline/.env.dev ]; then
                        cp /Users/ngaphuong/.jenkins/workspace/live2d-pipeline/.env.dev .env.dev
                    elif [ -f .env.example ]; then
                        cp .env.example .env.dev
                    fi
                fi
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps chromium'
            }
        }

        stage('Execute Playwright Tests') {
            steps {
                script {
                    def targetSuite = params.SUITE ?: 'all'
                    def testPattern = ""
                    switch(targetSuite) {
                        case 'ad100':
                            testPattern = "tests/**/ad100.*.spec.js"
                            break
                        case 'gacha-limited':
                            testPattern = "tests/**/aq201.*.spec.js"
                            break
                        case 'api':
                            testPattern = "tests/api"
                            break
                        case 'ui':
                            testPattern = "tests/ui"
                            break
                        case 'e2e':
                            testPattern = "tests/e2e"
                            break
                        case 'all':
                        default:
                            testPattern = ""
                            break
                    }
                    echo "🚀 Đang thực thi bộ kiểm thử [${targetSuite}] trên môi trường [${env.ENV}] với ${env.WORKERS} workers..."
                    sh "npx playwright test ${testPattern}"
                }
            }
        }
    }

    post {
        always {
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])
        }
    }
}
