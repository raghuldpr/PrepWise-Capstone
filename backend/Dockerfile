# Stage 1: Build Java application with Maven
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml ./

# Download dependencies (separate layer for caching)
RUN mvn dependency:go-offline -B || true

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -B -e

# Verify the JAR contains the main class (fail-fast)
RUN echo "=== Verifying JAR contents ===" && \
    jar tf target/app.jar | grep "PrepWiseApplication" && \
    unzip -p target/app.jar META-INF/MANIFEST.MF && \
    echo "=== JAR verification PASSED ==="

# Stage 2: Production JRE runtime image
FROM eclipse-temurin:17-jre

# Security: Create dedicated non-root user and group
RUN groupadd -r spring && useradd -r -g spring spring

# Create directory for file/document uploads with proper permissions
RUN mkdir -p /var/app/uploads && chown -R spring:spring /var/app/uploads

WORKDIR /app

# Copy compiled JAR file from builder stage
COPY --from=build /app/target/app.jar app.jar

USER spring:spring

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
