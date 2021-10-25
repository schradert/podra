# Transformer

## SBT

### Flags

JVM runtime flags are provided in `.sbtopts`:

```bash
# Thread Stack Size of 8MB
-J-Xss8M
# Initial Memory Allocation Pool of 1GB
-J-Xms1G
# Maximum Memory Allocation Pool of 8GB
-J-Xmx8G

-J-XX:ReservedCodeCacheSize=1G
-J-XX:MaxMetaspaceSize=2G
```

## Flink

### How To Run

```bash
flink run -c org.example.WordCount /path/to/snapshot.jar
```

## Frameless

- typed abstraction of spark RDDs, Datasets, and more
- *Benefits*:
    1. typesafe column referencing ==> NO runtime errors!
    2. custom typesafe encoders    ==> encoder-less types don't compile!
    3. typesafe casting/projection
    4. builtin function signature  ==> NO arithmetic on non-numerics!

## Cats

- https://typelevel.org/cats/jump_start_guide.html