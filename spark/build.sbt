Global / onChangedBuildSource := ReloadOnSourceChanges

scalaVersion := "2.12.9"

libraryDependencies ++= Seq(
  "org.apache.spark" %% "spark-core" % "3.1.2",
  "org.apache.spark" %% "spark-sql" % "3.1.2",
  "org.apache.spark" %% "spark-streaming" % "3.1.2",
)