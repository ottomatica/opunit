
# A simple ansible with docker test.

#### Create a simple VM with docker

Inside this directory, run:

```
baker bake --local .
```

Then

```
baker ssh auto-grade
```


#### Start a container.

```
docker run --name coffeemaker -d -it ubuntu:16.04 /bin/bash
```

#### Create a simple inventory file.

```
coffeemaker ansible_connection=docker
```

#### Install sudo and python-minimal

```
ansible-playbook -i sut/inventory playbooks/bootstrap.yml
```

#### Now you can run normal ansible!

```
ansible-playbook -i sut/inventory playbooks/simple.yml
```
# proxy 
See [gist](https://gist.github.com/dergachev/8441335).

```
cd images/basic && docker build --build-arg APT_PROXY_PORT=3142 -t autograde .
docker run --name coffeemaker -d -it autograde /bin/bash
```

```
sudo docker run -d --name apt-cacher -p 3142:3142 sameersbn/apt-cacher-ng:latest
```

Run simple.yml on a clean docker image. Then destroy/add proxy again, then try again. It should be cached.

#### Attach
docker attach coffeemaker
Ctrl+P Ctrl+Q