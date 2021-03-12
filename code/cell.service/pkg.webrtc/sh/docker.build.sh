# NOTE: Multi-architecture builds using `buildx` (x == experimental)
# See:
#     https://www.docker.com/blog/multi-arch-images
# 

yarn build
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t domains/rtc:latest --push .
