# Load .env file
include .env
export $(shell sed 's/=.*//' .env)

build:
	docker compose build

up:
	docker compose up -d

bump:
	@old_version=$$(grep APP_VERSION .env | cut -d '=' -f2); \
	new_version=$$(echo $$old_version | awk -F. '{ $$NF=sprintf("%02d", $$NF+1); OFS="."; print $$1,$$2,$$3 }'); \
	sed -i.bak "s/APP_VERSION=$$old_version/APP_VERSION=$$new_version/" .env && rm -f .env.bak; \
	echo "Bumped APP_VERSION from $$old_version to $$new_version"

tag:
	docker buildx build --platform $(PLATFORM) -t $(DOCKER_ACCOUNT)/$(IMAGE_NAME):$(APP_VERSION) .
	docker buildx build --platform $(PLATFORM) -t $(DOCKER_ACCOUNT)/$(IMAGE_NAME):latest .

push: tag
	docker push $(DOCKER_ACCOUNT)/$(IMAGE_NAME):$(APP_VERSION)
	docker push $(DOCKER_ACCOUNT)/$(IMAGE_NAME):latest

deploy: bump push
	ssh $(REMOTE) "docker pull $(DOCKER_ACCOUNT)/$(IMAGE_NAME):latest && \
		docker stop $(IMAGE_NAME) || true && \
		docker rm $(IMAGE_NAME) || true && \
		docker run -d -p 3000:3000 \
			-e ALLOWED_ORIGINS=$(ALLOWED_ORIGINS) \
			-e JWT_SECRET=$(JWT_SECRET) \
			-e APP_VERSION=$(APP_VERSION) \
			--name $(IMAGE_NAME) $(DOCKER_ACCOUNT)/$(IMAGE_NAME):latest"
