import { makeStyles } from "@material-ui/core/styles";
import { useRegisterSW } from "virtual:pwa-register/react";

const useStyles = makeStyles(() => ({
  container: {
    backgroundColor: "#000000",
  },
}));

export interface SWReloadPromptProps {
  intervalMS?: number;
}

export const SWReloadPrompt: React.FC<SWReloadPromptProps> = ({
  intervalMS = 60 * 60 * 1000, // default every hour
}: SWReloadPromptProps) => {
  // replaced dynamically
  const reloadSW = "__RELOAD_SW__";

  // Hooks
  const styles = useStyles();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered: (swReg) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reloadSW === "true"
        ? swReg &&
          setInterval(() => {
            console.log("Checking for SW updates ...");
            swReg.update();
          }, intervalMS)
        : console.log("SW Registered:", swReg);
    },
    onRegisterError: (error) => console.error("SW Registration Error:", error),
  });

  // logic
  function reload(): void {
    updateServiceWorker(true);
  }
  function close(): void {
    setOfflineReady(false);
    setNeedRefresh(false);
  }

  return (
    <div className={styles.container} data-test-id="SWReloadPrompt">
      {(offlineReady || needRefresh) && (
        <div className="toast">
          <div className="message">
            {offlineReady ? (
              <span>Ready to work offline!</span>
            ) : (
              <span>
                New content available! Click &quot;Reload&quot; to update.
              </span>
            )}
          </div>
          {needRefresh && (
            <button className="toast-button" onClick={reload}>
              Reload
            </button>
          )}
          <button className="toast-button" onClick={close}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};
