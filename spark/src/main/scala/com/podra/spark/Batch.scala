package com.podra
package spark

import org.apache.spark.{SparkContext, SparkConf}
import org.apache.spark.sql.{SparkSession, DataFrame}
import org.apache.spark.rdd.RDD


object LocalApp extends App {
  override val args = Array("data/input.csv", "data/output.csv")
  val (inputFile, outputFile) = (args(0), args(1))
  val conf = new SparkConf()
    .setMaster("local[*]")
    .setAppName("local-app")
  AppRunner.run(conf, inputFile, outputFile)
}

object ClusterApp extends App {
  val (inputFile, outputFile) = (args(0), args(1))
  AppRunner.run(new SparkConf(), inputFile, outputFile)
}


object AppRunner {
  def run(conf: SparkConf, inputFile: String, outputFile: String): Unit = {
    val session = SparkSession.builder().config(conf).getOrCreate()
    val data = session.read.csv(inputFile)

    data.printSchema()
    // val firstNameCounts = CSVCount.getFirstNamesCount(data)
    // firstNameCounts.saveAsTextFile(outputFile)
  }
}

// object CSVCount {
//   def getFirstNamesCount(df: DataFrame): RDD[(String, Int)] = {
    
//   }
// }