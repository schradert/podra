import { render, screen } from "@testing-library/react";
import App from "./App";
import { chrome } from "jest-chrome";

test("renders learn react link", () => {
    render(<App />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});
test("chrome api events", () => {
    const listenerSpy = jest.fn();
    const sendResponseSpy = jest.fn();

    chrome.runtime.onMessage.addListener(listenerSpy);
    expect(listenerSpy).not.toBeCalled();
    expect(chrome.runtime.onMessage.hasListeners()).toBe(true);

    // message, MessageSender, MessageResponse
    chrome.runtime.onMessage.callListeners(
        { greeting: "hello" },
        {},
        sendResponseSpy
    );
    expect(listenerSpy).toBeCalledWith(
        { greeting: "hello" },
        {},
        sendResponseSpy
    );
    expect(sendResponseSpy).not.toBeCalled();
});

test("chrome api synchronous functions", () => {
    const manifest: chrome.runtime.Manifest = {
        name: "Podra",
        manifest_version: 2,
        version: "0.0.1",
    };
    chrome.runtime.getManifest.mockImplementation(() => manifest);
    expect(chrome.runtime.getManifest()).toEqual(manifest);
    expect(chrome.runtime.getManifest).toBeCalled();
});

test("chrome api async functions w/ callback", () => {
    const message = { greeting: "hello?" };
    const response = { greeting: "here I am" };
    const callbackSpy = jest.fn();
    chrome.runtime.sendMessage.mockImplementation((_m, _i, _, cb) => {
        cb?.(response);
    });
    chrome.runtime.sendMessage(message, callbackSpy);
    expect(chrome.runtime.sendMessage).toBeCalledWith(message, callbackSpy);
    expect(callbackSpy).toBeCalledWith(response);
});

// lastError message getter function inside errored callback -- undefined outside!
test("chrome api functions w/ lastError", () => {
    const message = { greeting: "hello?" };
    const response = { greeting: "here I am" };
    const lastErrorMessage = "this is an error";
    const lastErrorGetter = jest.fn(() => lastErrorMessage);
    const lastError = {
        get message() {
            return lastErrorGetter();
        },
    };
    // mock implementation
    chrome.runtime.sendMessage.mockImplementation((_m, _i, _, cb) => {
        chrome.runtime.lastError = lastError;
        cb?.(response);
        delete chrome.runtime.lastError;
    });
    // callback implementation
    const lastErrorSpy = jest.fn();
    const callbackSpy = jest.fn(() => {
        if (chrome.runtime.lastError) {
            lastErrorSpy(chrome.runtime.lastError.message);
        }
    });
    chrome.runtime.sendMessage(message, callbackSpy);
    expect(callbackSpy).toBeCalledWith(response);
    expect(lastErrorGetter).toBeCalled();
    expect(lastErrorSpy).toBeCalledWith(lastErrorMessage);
    expect(chrome.runtime.lastError).toBeUndefined();
});
