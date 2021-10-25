package com.podra.transformer.batch

import org.apache.spark.SparkConf
import org.apache.spark.sql.SparkSession
import frameless.cats.implicits._
import cats.implicits._
import cats.data.ReaderT
import cats.effect.IO
import scala.collection.immutable.SortedMap

import frameless.cats.outer._
import frameless.syntax._
import frameless._
import org.apache.spark.rdd.RDD

import frameless.ml._
import frameless.ml.feature._
import frameless.ml.regression._
import org.apache.spark.ml.linalg._
import frameless.ml.classification.TypedRandomForestClassifier

import com.podra.Utils


final case class House(
    squareFeet: Double,
    hasGarden: Boolean,
    price: Double,
    city: String,
)
final case class FeaturedHouse(
    squareFeet: Double,
    hasGarden: Boolean,
    price: Double,
    city: String,
    features: Vector,
)
final case class IndexedFeaturedHouse(
    squareFeet: Double,
    hasGarden: Boolean,
    price: Double,
    city: String,
    features: Vector,
    cityIndexed: Double,
)
final case class StringIndexerInput(city: String)
final case class IndexStringerInput(predictedCityIndexed: Double)

object LocalApp extends App {
    val Conf: SparkConf = new SparkConf()
        .setMaster("local[*]")
        .setAppName("local-app")
        .set("spark.ui.enabled", "false")

    lazy val Session: SparkSession = SparkSession
            .builder()
            .config(Conf)
            .appName("podra-transformer")
            .getOrCreate()
    Session.sparkContext.setLogLevel("WARN")
}

object ClusterApp extends App {
    Runner.run(new SparkConf())
}

object Indexer {
    val indexer: TypedStringIndexer[StringIndexerInput] = TypedStringIndexer[StringIndexerInput]

    Utils.discard { indexer.estimator.setHandleInvalid("keep") }
}

object PriceRegressor {
    final case class Features(squareFeet: Double, hasGarden: Boolean)
    final case class Inputs(price: Double, features: Vector)
    final case class Prediction(
        squareFeet: Double,
        hasGarden: Boolean,
        price: Double,
        city: String,
        features: Vector,
        cityIndexed: Double,
        predictedPrice: Double
    )

    implicit val spark: SparkSession = LocalApp.Session
    val assembler: TypedVectorAssembler[Features] = TypedVectorAssembler[Features]
    val rfr: TypedRandomForestRegressor[Inputs] = TypedRandomForestRegressor[Inputs]

    def trainPredict(
        dsTrain: TypedDataset[House],
        dsTest: TypedDataset[House]
    ): Seq[Double] = {
        val dsTrainFeat = assembler.transform(dsTrain).as[FeaturedHouse]
        val dsTestFeat = assembler.transform(dsTest).as[FeaturedHouse]

        val idxModel = Indexer.indexer.fit(dsTrainFeat).run
        val dsTrainFeatIdx = idxModel.transform(dsTrainFeat).as[IndexedFeaturedHouse]
        val dsTestFeatIdx = idxModel.transform(dsTestFeat).as[IndexedFeaturedHouse]
        
        val preds = rfr.fit(dsTrainFeatIdx).run
            .transform(dsTestFeatIdx).as[Prediction]

        preds.select(preds.col('predictedPrice)).collect.run
    }
}

object CityClassifier {
    final case class Features(squareFeet: Double, price: Double)
    final case class Inputs(cityIndexed: Double, features: Vector)
    final case class IndexedPrediction(
        cityIndexed: Double,
        features: Vector,
        rawPrediction: Vector,
        probability: Vector,
        predictedCityIndexed: Double,
    )
    final case class StringeredPrediction(
        cityIndexed: Double,
        features: Vector,
        rawPrediction: Vector,
        probability: Vector,
        predictedCityIndexed: Double,
        predictedCity: String,
    )

    implicit val spark: SparkSession = LocalApp.Session
    val assembler: TypedVectorAssembler[Features] = TypedVectorAssembler[Features]
    val rfc: TypedRandomForestClassifier[Inputs] = TypedRandomForestClassifier[Inputs]

    def trainPredict(
        dsTrain: TypedDataset[House],
        dsTest: TypedDataset[House]
    ): Seq[String] = {
        val dsTrainFeat = assembler.transform(dsTrain).as[FeaturedHouse]
        val dsTestFeat = assembler.transform(dsTest).as[FeaturedHouse]

        val idxModel = Indexer.indexer.fit(dsTrainFeat).run
        val dsTrainFeatIdx = idxModel.transform(dsTrainFeat).as[IndexedFeaturedHouse]
        val dsTestFeatIdx = idxModel.transform(dsTestFeat).as[IndexedFeaturedHouse]
        val testInput = dsTestFeatIdx.project[Inputs]
        
        val predsIdx = rfc.fit(dsTrainFeatIdx).run
            .transform(testInput).as[IndexedPrediction]
        val preds = TypedIndexToString[IndexStringerInput](
            idxModel.transformer.labelsArray.flatten
        ).transform(predsIdx).as[StringeredPrediction]

        preds.select(preds.col('predictedCity)).collect.run
    }

}

object Runner {

    private def createSession(
        conf: SparkConf,
        logLevel: String
    ): SparkSession = {
        val session = SparkSession
            .builder()
            .config(conf)
            .appName("podra-transformer")
            .getOrCreate()
        session.sparkContext.setLogLevel(logLevel)
        session
    }

    def run(conf: SparkConf): Unit = {
        implicit val session = createSession(conf, "WARN")

        val dsTrain = TypedDataset.create(Seq(
            House(20, false, 100000, "Lyon"),
            House(50, false, 200000, "Lyon"),
            House(50, true, 250000, "San Francisco"),
            House(100, true, 500000, "San Francisco")
        ))
        val dsTestRFR = TypedDataset.create(Seq(
            House(70, true, 0, "San Francisco"),
        ))
        val dsTestRFC = TypedDataset.create(Seq(
            House(120, false, 800000, "")
        ))

        val predPrice: Seq[Double] = 
            PriceRegressor.trainPredict(dsTrain, dsTestRFR)
        val predCity: Seq[String] = 
            CityClassifier.trainPredict(dsTrain, dsTestRFC)

        print(s"predPrice(s): ${predPrice}")
        print(s"predCity(-ies): ${predCity}")

        session.stop()
    }

}

object AppRunner {
    final case class Apartment(
        city: String,
        surface: Int,
        price: Double,
        bedrooms: Int
    )
    final case class Person(
        age: Int,
        birthday: java.util.Date,
        gender: Gender
    )
    sealed trait Gender
    case object Male extends Gender
    case object Female extends Gender
    case object Other extends Gender
    
    private def createSession(
        conf: SparkConf,
        logLevel: String
    ): SparkSession = {
        val session = SparkSession
            .builder()
            .config(conf)
            .appName("podra-transformer")
            .getOrCreate()
        session.sparkContext.setLogLevel(logLevel)
        session
    }

    def run(conf: SparkConf, inputFile: String, outputFile: String): Unit = {
        implicit val session = createSession(conf, "WARN")
        val spCtx = session.sparkContext
        // import session.implicits._

        val csvData = session
            .read
            .options(
                Map(
                    "inferSchema" -> "true",
                    "delimiter" -> ",",
                    "header" -> "true",
                )
            )
            .csv(inputFile)
        print(csvData)
        csvData.printSchema()
        csvData.write.csv(outputFile)

        val apartments = Seq(
            Apartment("New York", 100, 150000.0, 2),
            Apartment("Paris", 100, 450000.0, 3),
            Apartment("Paris", 25,  250000.0, 1),
            Apartment("Lyon",  83,  200000.0, 2),
            Apartment("Lyon",  45,  133000.0, 1),
            Apartment("Nice",  74,  325000.0, 3)
        )
        val people = Seq(
            Person(42, new java.util.Date, Male)
        )

        implicit val dateToLongInjection = Injection(
            (_: java.util.Date).getTime(),
            new java.util.Date((_: Long))
        )
        implicit val genderToIntInjection = new Injection[Gender, Int] {
            def apply(gender: Gender): Int = gender match {
                case Male => 0
                case Female => 1
                case Other => 2
            }
            def invert(num: Int): Gender = num match {
                case 0 => Male
                case 1 => Female
                case _ => Other
            }
        }
        val people_tds = TypedDataset.create(people)
        val apartments_tds = TypedDataset.create(apartments)

        val countAndTakeJob =
            for {
                count <- apartments_tds.count()
                sample <- apartments_tds.take((count / 5).toInt).map(_.map(_.surface))
            } yield sample
        def sampleMin(sample: Job[Seq[Int]]): Job[Int] = 
            sample.map(a => a.foldLeft(a(0))(_ min _))

        val surfaceMin = sampleMin(countAndTakeJob)
            .withGroupId("job-group")
            .withDescription("Calculate min of 20% sample")
            .run()
        print(surfaceMin)
        print(apartments_tds)
        print(people_tds)

        type Action[T] = ReaderT[IO, SparkSession, T]
        val typed_ds = TypedDataset.create(Seq(
            (1, "string"), (2, "another")
        ))
        val result: Action[(Seq[(Int, String)], Long)] = 
            for {
                sample <- typed_ds.take[Action](1)
                count <- typed_ds.count[Action]()
            } yield (sample, count)
        val resultWithDescription: Action[(Seq[(Int, String)], Long)] =
            for {
                res <- result
                session <- ReaderT.ask[IO, SparkSession]
                _ <- ReaderT.liftF {
                    IO {
                        val description = session.sparkContext.getLocalProperty("spark.job.description")
                        println(s"Description: ${description}")
                    }
                }
            } yield res
        val finalResult = resultWithDescription
            .run(session)
            .unsafeRunSync()
        print(finalResult)

        type AllData = RDD[(String, SortedMap[String, Int])]
        val allData1: AllData = spCtx.makeRDD(
            ("Bob", SortedMap("task1" -> 12)) :: 
            ("Joe", SortedMap("task1" -> 1, "task2" -> 3)) :: 
            ("Anna", SortedMap("task1" -> 100)) :: 
            ("Bob", SortedMap("task1" -> 10, "task2" -> 21)) :: 
            ("Joe", SortedMap("task1" -> 7, "task2" -> 2)) ::
            Nil
        )
        val allData2: AllData = spCtx.makeRDD(
            ("Bob", SortedMap("task1" -> 12)) :: 
            ("Joe", SortedMap("task1" -> 1, "task2" -> 3)) :: 
            ("Anna", SortedMap("task1" -> 100)) :: 
            ("Bob", SortedMap("task1" -> 10, "task2" -> 21)) :: 
            ("Joe", SortedMap("task1" -> 7, "task2" -> 2)) ::
            Nil
        )
        // implicit full outer join!
        val daysCombined = allData1 |+| allData2
        val totalPerUser = daysCombined.csumByKey.collectAsMap
        print(totalPerUser)

        val vector = Vectors.dense(1, 2, 3)
        val vectorDS = TypedDataset.create(Seq("label" -> vector))
        print(vectorDS)

        val matrix = Matrices.dense(2, 1, Array(1, 2))
        val matrixDS = TypedDataset.create(Seq("label" -> matrix))
        print(matrixDS)
        
        // Closing
        session.stop()
    }
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

