# Stage 1: Build Java application with Maven
FROM maven:3.9-eclipse-temurin-17-alpine AS build

# Set working directory inside container
WORKDIR /app

# Copy pom.xml and source code to build executable JAR
COPY pom.xml ./
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Production JRE runtime image
FROM eclipse-temurin:17-jre-alpine

# Security: Create dedicated non-root user and group
RUN addgroup -S spring && adduser -S spring -G spring

# Create directory for file/document uploads with proper permissions
RUN mkdir -p /var/app/uploads && chown -R spring:spring /var/app/uploads

# Set working directory
WORKDIR /app

# Copy compiled JAR file from builder stage
COPY --from=build /app/target/*.jar app.jar

# Switch to non-root user
USER spring:spring

# Expose Spring Boot port
EXPOSE 8080

# Configure health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Production execution entrypoint
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
