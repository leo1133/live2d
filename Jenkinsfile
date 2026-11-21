pipeline {
    agent any

    environment {
        CI = 'true'
        ENV = 'dev'
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
                if [ ! -f .env.dev ] && [ -f .env.example ]; then
                    cp .env.example .env.dev
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
                sh 'npx playwright test tests/**/ad100.*.spec.js --max-failures=5'
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
