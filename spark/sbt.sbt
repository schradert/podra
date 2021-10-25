import Util._

Global / onChangedBuildSource := ReloadOnSourceChanges
Global / excludeLintKeys ++= Set(
    autoStartServer,
    turbo,
    evictionWarningOptions,
)

Test / parallelExecution := false
Test / testOptions += Tests.Argument(TestFrameworks.ScalaTest, "-oSD")
Test / turbo := true

ThisBuild / autoStartServer := false
ThisBuild / includePluginResolvers := true
ThisBuild / turbo := true

ThisBuild / watchBeforeCommand := Watch.clearScreen
ThisBuild / watchTriggeredMessage := Watch.clearScreenOnTrigger
ThisBuild / watchForceTriggerOnAnyChange := true

ThisBuild / shellPrompt := { state => s"${prompt(projectName(state))}> " }
ThisBuild / watchStartMessage := {
    case (iteration, ProjectRef(build, projectName), commands) =>
        Some {
            s"""|~${commands.map(styled).mkString(";")}
                |Monitoring source files for ${prompt(
                projectName
            )}...""".stripMargin
        }
}

addCommandAlias(
    "styleCheck",
    "scalafmtSbtCheck; scalafmtCheckAll; Test / compile; scalafixAll --check; scalastyle; Test / scalastyle",
)
addCommandAlias(
    "styleFix",
    "Test / compile; scalafixAll; scalafmtSbt; scalafmtAll",
)
addCommandAlias(
    "up2date",
    "reload plugins; dependencyUpdates; reload return; dependencyUpdates",
)
addCommandAlias(
    "coverage",
    "clean coverage test coverageReport"
)

onLoadMessage +=
    s"""|
        |╭─────────────────────────────────╮
        |│     List of defined ${styled("aliases")}     │
        |├─────────────┬───────────────────┤
        |│ ${styled("styleCheck")}  │ fmt & fix checks  │
        |│ ${styled("styleFix")}    │ fix then fmt      │
        |│ ${styled("up2date")}     │ dependencyUpdates │
        || ${styled("coverage")}    | coverageReport    |
        |╰─────────────┴───────────────────╯""".stripMargin
