```bash
docker build -t avgaltsev/eagle-mqtt:0.0.0 ./
docker push avgaltsev/eagle-mqtt:0.0.0
```

Create eagle-mqtt config.

```bash
docker volume create eagle-mqtt-config
```

Copy `src/json/default-config.json` to `config.json` inside the volume `eagle-mqtt-config` and edit it.

Start the container.

```bash
docker run -d --name=eagle-mqtt --restart=unless-stopped --net=host -v eagle-mqtt-config:/root/config/ avgaltsev/eagle-mqtt:0.0.0
```

Updating config.

```bash
sudo nano /var/lib/docker/volumes/eagle-mqtt-config/_data/config.json
docker restart eagle-mqtt
```

Using file import mode
----------------------

Disable HTTP listener in config.json.

Run `LOG_LEVEL=3 npm start path1.log path2.log path3.log`.
