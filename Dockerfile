FROM debian:bullseye

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update

RUN apt-get install -y curl gnupg2 lsb-release

RUN curl -sfL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
	sh -c 'echo "deb https://deb.nodesource.com/node_19.x `lsb_release -cs` main" >> /etc/apt/sources.list.d/nodesource.list'

RUN apt-get update && \
	apt-get install -y nodejs git

WORKDIR /root/

COPY ./ ./

RUN npm config set unsafe-perm true && npm install

VOLUME /root/config/

CMD npm start
