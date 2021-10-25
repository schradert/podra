// FIXME: unused??? ThisBuild / name := "podra-transformer"
ThisBuild / version := "0.1-SNAPSHOT"
ThisBuild / organization := "com.podra.transformer"
ThisBuild / scalaVersion := "2.12.15"
ThisBuild / scalacOptions ++= Seq(
    // options with arguments
    // scalafix -ignore
    "-encoding", "UTF-8", // specifies character encoding in source files
    // options without arguments
    "-language:_", // enables all language features
    "-Xfatal-warnings", // fails if any warnings
    "-Xlint:_", // enables all linting options
    "-Ywarn-unused", // needed for `scalafix`
    "-Ywarn-macros:after",
    "-Ypartial-unification"
    // FIXME: bad options?
    // "-Wdead-code",        // warns if there is dead code
    // "-Wvalue-discard",    // warns when non-Unit expression is unused
)
ThisBuild / resolvers ++= Seq(
    "Apache Development Snapshot Repository" at "https://repository.apache.org/content/repositories/snapshots/",
    Resolver.sonatypeRepo("releases"),
    Resolver.sonatypeRepo("snapshots"),
    Resolver.mavenLocal,
)

// SCALAFIX
ThisBuild / scalafixScalaBinaryVersion := scalaBinaryVersion.value
ThisBuild / scalafixDependencies ++= Seq(
    Dependencies.com.github.liancheng.`organize-imports`
)
ThisBuild / semanticdbEnabled := true
ThisBuild / semanticdbVersion := scalafixSemanticdb.revision
ThisBuild / wartremoverWarnings ++= Warts.allBut(
    Wart.ImplicitConversion,
    Wart.ImplicitParameter,
    Wart.ExplicitImplicitTypes,
    Wart.Any,
    Wart.Nothing,
)

Compile / console / scalacOptions :=
    (console / scalacOptions)
        .value
        .filterNot(_.contains("wartremover"))
scalastyleFailOnWarning := false

def makeColorConsole(): Unit = {
  val ansi = System.getProperty("sbt.log.noformat", "false") != "true"
  if (ansi) System.setProperty("scala.color", "true")
}

lazy val `podra-transformer` = project
    .in(file("."))
    .settings(
        compilerPlugins,
        dependencies,
        name := "podra-transformer",
        initialize ~= { _ => makeColorConsole() },
        scalacOptions ~= { 
            _.filterNot(Set(
                "-Ywarn-unused:locals",
                "-Xlint:unused",
                "-Wunused:locals"
            )) 
        },
    )

lazy val compilerPlugins = Seq(
    addCompilerPlugin(Dependencies.com.olegpy.`better-monadic-for`),
    addCompilerPlugin(Dependencies.org.augustjune.`context-applied`),
    addCompilerPlugin(Dependencies.org.typelevel.`kind-projector`),
)

lazy val dependencies = Seq(
    libraryDependencies ++= Seq(
        Dependencies.org.scalactic.scalactic,
        Dependencies.org.apache.flink.`flink-clients`,
        Dependencies.org.apache.flink.`flink-scala`,
        Dependencies.org.apache.flink.`flink-streaming-scala`,
        Dependencies.org.apache.flink.`flink-connector-kafka`,
        Dependencies.org.apache.spark.`spark-core`,
        Dependencies.org.apache.spark.`spark-sql`,
        Dependencies.org.apache.spark.`spark-mllib`,
        Dependencies.org.apache.spark.`spark-streaming`,
        Dependencies.org.typelevel.`frameless-dataset`,
        Dependencies.org.typelevel.`frameless-ml`,
        Dependencies.org.typelevel.`frameless-cats`,
        Dependencies.org.typelevel.`cats-core`,
        Dependencies.org.typelevel.`cats-mtl`,
        Dependencies.org.typelevel.kittens,
        Dependencies.org.typelevel.mouse
    ),
    libraryDependencies ++= Seq(
        Dependencies.com.github.alexarchambault.`scalacheck-shapeless_1.15`,
        Dependencies.org.scalacheck.scalacheck,
        Dependencies.org.scalatest.scalatest,
        Dependencies.org.scalatestplus.`scalacheck-1-15`,
        Dependencies.org.typelevel.`discipline-scalatest`,
        Dependencies.com.`47deg`.`scalacheck-toolbox-datetime`,
        Dependencies.com.`47deg`.`scalacheck-toolbox-magic`,
        Dependencies.com.`47deg`.`scalacheck-toolbox-combinators`,
    ).map(_ % Test),
)
