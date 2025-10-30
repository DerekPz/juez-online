FROM openjdk:17-slim

# Instala Python (para scripts del runner)
RUN apt-get update && apt-get install -y python3 && apt-get clean

WORKDIR /runner
COPY runner.sh /runner/
RUN chmod +x /runner/runner.sh

ENTRYPOINT ["/runner/runner.sh"]
