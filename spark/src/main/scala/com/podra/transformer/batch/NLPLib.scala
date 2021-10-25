package com.podra.transformer.batch

import frameless.TypedDataset
import frameless.TypedDataset
import org.apache.spark.SparkConf
import cats.data.ReaderT
import frameless.functions.aggregate._
import cats.data.ReaderT
import cats.effect.IO
import cats.implicits._
import frameless.cats.implicits._
import org.apache.spark.sql.SparkSession

object NLPRunner extends App {
    val Conf: SparkConf = new SparkConf()
        .setMaster("local[*]")
        .setAppName("local-app")
        .set("spark.ui.enabled", "false")

    val Session: SparkSession = SparkSession
        .builder()
        .config(Conf)
        .appName("podra-transformer")
        .getOrCreate()
    
    type Neighborhood = String
    type Address = String
    type Action[T] = ReaderT[IO, SparkSession, T]

    // implicit val addrToStr: Injection[Address, String] = Injection(
    //     (_: Address).toString(),
    //     Address(_: String)
    // )
    // implicit val nbhToStr: Injection[Neighborhood, String] = Injection(
    //     (_: Neighborhood).toString(),
    //     (_: String).asInstanceOf[Neighborhood]
    // )

    final case class PhonebookEntry(
        address: Address,
        residents: String,
        phoneNumber: String
    )

    final case class CityMapEntry(
        address: Address,
        neighborhood: Neighborhood
    )

    final case class Family(residents: String, neighborhood: Neighborhood)
    @SuppressWarnings(Array("org.wartremover.warts.ArrayEquals"))
    final case class FamilyMembers(
        residents: Array[String],
        neighborhood: Neighborhood
    )
    final case class Person(name: String, neighborhood: Neighborhood)
    final case class NeighborhoodCount(neighborhood: Neighborhood, count: Long)

    def uniqueName(name: String): Boolean = name.exists(Set('x', 'q', 'z'))

    def split(str: String): Array[String] = str.split(' ')

    def bestNeighborhoods(
        phonebookTDS: TypedDataset[PhonebookEntry],
        cityMapTDS: TypedDataset[CityMapEntry],
    ): Action[Seq[Neighborhood]] = {
        def pbcmJoinTD: TypedDataset[(PhonebookEntry, CityMapEntry)] = {
            phonebookTDS.joinInner(cityMapTDS) {
                phonebookTDS('address) === cityMapTDS('address)
            }
        }
        
        def familiesTD: TypedDataset[Family] = {
            pbcmJoinTD.select(
                pbcmJoinTD.colMany('_1, 'residents),
                pbcmJoinTD.colMany('_2, 'neighborhood)
            ).as[Family]
        }

        def uniqueResidentsTD: TypedDataset[Person] = {
            val splitUDF = familiesTD.makeUDF(split _)
            val familiesAsArrayTD = familiesTD
                .select(
                    splitUDF(familiesTD('residents)),
                    familiesTD('neighborhood)
                ).as[FamilyMembers]

            val residents: TypedDataset[Person] =
                familiesAsArrayTD.explode('residents).as[Person]
            val uniqueNameUDF = residents.makeUDF(uniqueName _)
            residents.filter(uniqueNameUDF(residents('name)))
        }

        def countUniquePeoplePerNeighborhoodTD: TypedDataset[NeighborhoodCount] = {
            uniqueResidentsTD
                .groupBy(uniqueResidentsTD('neighborhood))
                .agg(count())
                .as[NeighborhoodCount]
        }

        def rankedNeighborhoodsByMostUniquePeopleTD: TypedDataset[Neighborhood] = {
            countUniquePeoplePerNeighborhoodTD
                .orderBy(countUniquePeoplePerNeighborhoodTD('count).desc)
                .select(countUniquePeoplePerNeighborhoodTD('neighborhood))
                .as[Neighborhood]
        }

        val top3Neighborhoods: Action[Seq[Neighborhood]] = for {
            top <- rankedNeighborhoodsByMostUniquePeopleTD.take[Action](3)
        } yield top

        top3Neighborhoods
    }

    def run()(implicit sqlContext: SparkSession): Unit = {

        val phonebookTDS = TypedDataset.create(Seq(
            PhonebookEntry("123 Main Rd", "Mom Dad Baby", "123-456-7890"),
            PhonebookEntry("456 Road St", "Me You", "098-765-4321"),
            PhonebookEntry("789 Street Ln", "Joe Gigi", "234-567-8901"),
            PhonebookEntry("1234 Lane Ct", "He She They", "345-678-9012"),
            PhonebookEntry("5678 Court Blvd", "It", "456-789-0123"),
        ))
        val cityMapTDS = TypedDataset.create(Seq(
            CityMapEntry("123 Main Rd", "The Estates"),
            CityMapEntry("456 Road St", "Hacienda del Sol"),
            CityMapEntry("789 Street Ln", "Ridge Mountain"),
            CityMapEntry("1234 Lane Ct", "The Palisades"),
            CityMapEntry("5678 Court Blvd", "Bairro Balde"),
        ))
        val action: Action[Seq[Neighborhood]] = for {
            r <- bestNeighborhoods(phonebookTDS, cityMapTDS)
            session <- ReaderT.ask[IO, SparkSession]
            _ <- ReaderT.liftF {
                IO {
                    println(s"Description: ${session.sparkContext.getLocalProperty("Session.job.description")}")
                }
            }
        } yield r
    
        val result: Seq[Neighborhood] = action.run(Session).unsafeRunSync()
        println(result)
    }

}