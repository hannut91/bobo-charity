# Bobo Server

## Install

```bash
$ npm i
```

## Config

* root폴더에 `.env`파일이 서버를 실행하는데 필요한 정보를 가지고 있습니다.
  `.test.env`를 참고해서 새로 `.env`파일을 생성하면 됩니다.
* `.test.env`는 테스트를 실행하는데 사용되는 환경변수입니다.

## Run

```bash
$ npm start
```

## Test

```bash
$ npm run test 
```

## Test Watch

```bash
$ npm run watch
```

or

```bash
npm run watch -- testFileName
```

## Docker push

```bash
$ docker tag bobo-api-server hannut1/bobo-api-server
$ docker push hannut1/bobo-api-server
```

## Docker pull

```bash
$ docker pull hannut1/bobo-api-server
$ docker tag hannut1/bobo-api-server bobo-api-server
$ MONGODB_URI=mongodb://<user>:<password>@172.17.0.1:27017/bobo SESSION_SECRET=secret ADMIN_PRIVATE_KEY=Y8mLNAWcRLu754ao1oDA2B4hgvDmuPxcJtw4pLHgZaR9GbNdEGPP docker-compose up
```
