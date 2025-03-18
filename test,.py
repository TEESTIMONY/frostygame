import redis

r = redis.Redis.from_url("redis://default:6nJ8zoHPQiPpIgaKmVe5FsT6ucYjaeXM@redis-17664.c341.af-south-1-1.ec2.redns.redis-cloud.com:17664")

success = r.set("foo", "bar")
# True

result = r.get("foo")
print(result)
# >>> bar
