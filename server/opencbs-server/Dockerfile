# ── Stage 1: Build all Maven modules ──────────────────────────────────────────
FROM maven:3.8-eclipse-temurin-8 AS builder

WORKDIR /build

# Maven 3.8 blocks plain-HTTP repos by default.
# jasperreports:6.10.0 pulls com.lowagie:itext:2.1.7.js7 from Jaspersoft JFrog
# over HTTP — override the blocker mirror so it is disabled.
RUN mkdir -p /root/.m2 && printf '<settings>\n  <mirrors>\n    <mirror>\n      <id>maven-default-http-blocker</id>\n      <mirrorOf>dummy</mirrorOf>\n      <url>http://0.0.0.0/</url>\n    </mirror>\n  </mirrors>\n</settings>\n' > /root/.m2/settings.xml

# Copy entire server source tree
COPY server/ .

# Build modules in the required dependency order, then package the server JAR
RUN mvn -f opencbs-spring-boot-starter/pom.xml clean install -DskipTests \
 && mvn -f opencbs-core/pom.xml           clean install -DskipTests \
 && mvn -f opencbs-loans/pom.xml          clean install -DskipTests \
 && mvn -f opencbs-borrowings/pom.xml     clean install -DskipTests \
 && mvn -f opencbs-savings/pom.xml        clean install -DskipTests \
 && mvn -f opencbs-term-deposits/pom.xml  clean install -DskipTests \
 && mvn -f opencbs-bonds/pom.xml          clean install -DskipTests \
 && mvn -f opencbs-server/pom.xml         clean package  -DskipTests -DBUILD_VERSION=1.0.0 -Dexec.skip=true

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM eclipse-temurin:8-jre-alpine

# LABEL maintainer="Bektur Mambetov"
WORKDIR /app

COPY --from=builder /build/opencbs-server/target/*.jar app.jar
# application-docker.properties is bundled inside the JAR; activate it via the
# spring profile so no secrets are copied into the image layer.

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", \
            "-Dspring.profiles.active=docker", \
            "-jar", "app.jar"]

