pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-cred')
        DOCKER_IMAGE = 'muhammadazfa/blog-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        MINIKUBE_CREDS = credentials('minikube-cred')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                dir('simple-blog') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                sh 'echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin'
                sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                sh "docker push ${DOCKER_IMAGE}:latest"
                sh 'docker logout'
            }
        }
        
        stage('Update Kubernetes Manifests') {
            steps {
                sh "sed -i 's|image: ${DOCKER_IMAGE}:[^[:space:]]*|image: ${DOCKER_IMAGE}:${DOCKER_TAG}|g' k8s/deployment.yaml"
            }
        }
        
        stage('Deploy to Minikube') {
            steps {
                withCredentials([file(credentialsId: 'minikube-cred', variable: 'KUBECONFIG')]) {
                    sh 'export KUBECONFIG=$KUBECONFIG'
                    sh 'kubectl apply -f k8s/deployment.yaml'
                    sh 'kubectl apply -f k8s/service.yaml'
                    sh 'kubectl rollout status deployment/blog-app'
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                withCredentials([file(credentialsId: 'minikube-cred', variable: 'KUBECONFIG')]) {
                    sh 'export KUBECONFIG=$KUBECONFIG'
                    sh 'kubectl get pods | grep blog-app'
                    sh 'kubectl get services | grep blog-app'
                }
            }
        }
    }
    
    post {
        always {
            // Clean up local Docker images to save disk space
            sh "docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true"
            sh "docker rmi ${DOCKER_IMAGE}:latest || true"
            
            // Send notifications
            emailext (
                subject: "Build ${currentBuild.currentResult}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p>Build ${currentBuild.currentResult}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
                <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
        }
    }
}