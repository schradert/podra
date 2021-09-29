package com.podra
package spark
package counters

import org.apache.spark.streaming.{StreamingContext, Seconds}

object Main {
}

// object WordCount {
//   val input = Context.ctx.textFile("data/input.txt")

//   val count = input
//     .flatMap(_.split(" "))
//     .map((_, 1))
//     .reduceByKey(_ + _)
  
//   count.saveAsTextFile("data/output.txt")
//   println("OK")
// }

// object IntegerCount {
//   val data: Array[Int] = Array(1, 3, 5, 2, 3, 1, 4, 7, 8, 5, 2, 3);
//   val dataRdd = Context.ctx.parallelize(data)

//   val count = dataRdd
//     .map((_, 1))
//     .reduceByKey(_ + _)

//   println(count)
//   println("OK")
// }

// object StreamCount {
//   val streamCtx = new StreamingContext(Context.ctx, Seconds(20))
//   val lines = streamCtx.socketTextStream("localhost", 9999)
// }