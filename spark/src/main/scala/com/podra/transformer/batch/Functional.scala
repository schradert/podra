package com.podra.transformer.batch

import cats.implicits._
import cats.sequence._
import cats.{Show, Functor, derived}

object Main {
    final case class Cat[Food](food: Food, foods: List[Food])
    final case class Address(street: String, city: String, state: String)
    final case class ContactInfo(phoneNumber: String, address: Address)
    final case class People(name: String, contactInfo: ContactInfo)

    implicit val fc: Functor[Cat] = derived.semiauto.functor
    implicit val addressShow: Show[Address] = 
        a => s"${a.street}, ${a.city}, ${a.state}"
    implicit val peopleShow: Show[People] = derived.semiauto.show

    val cat: Cat[Int] = Cat(1, List(2, 3))
    print(cat.map(_ + 1))

    val mike: People = People(
        "Mike", 
        ContactInfo("202-295-3928", Address("1 Main ST", "Chicago", "IL"))
    )
    print(mike.show)
}

object FunctionalSequence {
    val f1: String => Int = (_: String).length
    val f2: String => String = (_: String).reverse
    val f3: String => Float = (_: String).toFloat
    // GENERICS
    final case class Object(a: Int, b: String, c: Float)
    val generic: sequenceGen[Object] = sequenceGeneric[Object]
    val g: String => Object = generic(a = f1, b = f2, c = f3)
    val does_it_work: Object = g("42.0")  // Object(4, "0.24", 42.0)
}