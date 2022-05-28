FROM texlive/texlive:latest AS base

# Install required dependencies
RUN apt-get -y update
RUN apt-get -y install nodejs
RUN apt-get -y install npm

# Move source
RUN mkdir /home/xmd
WORKDIR /home/xmd
# Content is copied, not the directory
COPY . .

# Build
RUN npm run build
WORKDIR /home/xmd/lib

ENTRYPOINT [ "node", "xmdparser.js" ]
