import sbt._

object Dependencies {
    case object com {
        case object github {
            case object alexarchambault {
                val `scalacheck-shapeless_1.15` =
                    "com.github.alexarchambault" %% "scalacheck-shapeless_1.15" % "1.3.0"
            }

            case object liancheng {
                val `organize-imports` =
                    "com.github.liancheng" %% "organize-imports" % "0.5.0"
            }
        }

        case object olegpy {
            val `better-monadic-for` =
                "com.olegpy" %% "better-monadic-for" % "0.3.1"
        }

        case object `47deg` {
            val name = "com.47deg"
            val version = "0.6.0"
            val `scalacheck-toolbox-datetime` =
                name %% "scalacheck-toolbox-datetime" % version
            val `scalacheck-toolbox-magic` =
                name %% "scalacheck-toolbox-magic" % version
            val `scalacheck-toolbox-combinators` =
                name %% "scalacheck-toolbox-combinators" % version
        }
    }

    case object org {
        case object augustjune {
            val `context-applied` =
                "org.augustjune" %% "context-applied" % "0.1.4"
        }

        case object scalacheck {
            val scalacheck =
                "org.scalacheck" %% "scalacheck" % "1.15.4"
        }

        case object scalatest {
            val scalatest =
                "org.scalatest" %% "scalatest" % "3.2.10"
        }

        case object scalactic {
            val scalactic =
                "org.scalactic" %% "scalactic" % "3.2.10"
        }

        case object scalatestplus {
            val `scalacheck-1-15` =
                "org.scalatestplus" %% "scalacheck-1-15" % "3.2.10.0"
        }

        case object typelevel {
            val name = "org.typelevel"
            val framelessVersion = "0.9.0"

            val `discipline-scalatest` =
                name %% "discipline-scalatest" % "2.1.5"

            val `kind-projector` =
                "org.typelevel" %% "kind-projector" % "0.13.2" cross CrossVersion.full

            val `frameless-cats` = name %% "frameless-cats" % framelessVersion
            val `frameless-ml` = name %% "frameless-ml" % framelessVersion
            val `frameless-dataset` = name %% "frameless-dataset" % framelessVersion
            val `cats-core` = name %% "cats-core" % "2.3.0"
            val `cats-mtl` = name %% "cats-mtl" % "1.2.0"
            val kittens = name %% "kittens" % "2.3.0"
            val mouse = name %% "mouse" % "1.0.6"
        }

        case object apache {
            case object flink {
                val name = "org.apache.flink"
                val version = "1.14.0"
                val `flink-clients` =
                    name %% "flink-clients" % version % "provided"
                val `flink-scala` = name %% "flink-scala" % version % "provided"
                val `flink-streaming-scala` =
                    name %% "flink-streaming-scala" % version % "provided"
                val `flink-connector-kafka` = 
                    name %% "flink-connector-kafka" % version
            }

            case object spark {
                val name = "org.apache.spark"
                val version = "3.1.2"
                val `spark-core` = name %% "spark-core" % version
                val `spark-sql` = name %% "spark-sql" % version
                val `spark-mllib` = name %% "spark-mllib" % version
                val `spark-streaming` = name %% "spark-streaming" % version
            }
        }
    }
}
