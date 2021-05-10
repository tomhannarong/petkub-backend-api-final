FROM node:14-alpine
WORKDIR /usr/src/app
#copy package.json file under the working directory 
COPY package.json /usr/src/app
# install all the dependencies 
RUN yarn
#copy all your files under the working directory
COPY . /usr/src/app
#expose the port 5000
EXPOSE 5000
#start nodejs server 
CMD yarn start