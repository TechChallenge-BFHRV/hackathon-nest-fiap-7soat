## Local Kubernetes Environment

1. Generate a config map based on your local `.env` file with the command `kubectl create configmap my-config --from-env-file=.env`
2. Run `kubectl apply -f k8s/postgres-deployment.yaml`
3. Run `kubectl apply -f k8s/deployment.yaml`
4. Run `kubectl apply -f k8s/service.yaml`
5. Execute `kubectl get services`
6. Get the **external port** from the hackathon-nest and then in your browser navigate to `http://localhost:ExternalPort`