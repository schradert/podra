package com.podra.transformer

import org.scalacheck.ScalacheckShapeless
import org.scalatest._
import org.scalatest.funsuite.AnyFunSuite
import org.scalatest.matchers.should
import org.scalatestplus.scalacheck.ScalaCheckPropertyChecks
import org.typelevel.discipline.scalatest.FunSuiteDiscipline

trait TestSuite
    extends AnyFunSuite
       with should.Matchers
       with GivenWhenThen
       with BeforeAndAfterAll
       with BeforeAndAfterEach
       with ScalaCheckPropertyChecks
       with ScalacheckShapeless
       with FunSuiteDiscipline {
    final protected type Arbitrary[A] =
        org.scalacheck.Arbitrary[A]

    final protected val arbitrary: org.scalacheck.Arbitrary.type =
        org.scalacheck.Arbitrary

    final protected type Assertion =
        org.scalatest.compatible.Assertion

    final protected type Gen[+A] =
        org.scalacheck.Gen[A]

    final protected val gen: org.scalacheck.Gen.type =
        org.scalacheck.Gen
}

final class ExampleSuite extends TestSuite {
    test("hello world") {
        1 shouldBe 1
    }
}
