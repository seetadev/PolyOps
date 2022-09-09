

dev:
	yarn lerna run dev --stream --parallel

dev-test:
	yarn lerna run test:watch --stream --parallel

build-demo:
	yarn lerna run build --scope @celo/react-celo --stream
	yarn lerna run build --scope example --stream

clean:
	rm -rf node_modules packages/**/node_modules packages/**/lib packages/**/.next

publish:
	cd packages/react-celo && yarn build && npm version patch && npm publish --public

.PHONY: dev build-demo publish clean