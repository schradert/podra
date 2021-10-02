package com.podra.loader.models;

public interface Node {
    public static final Node ROOT = null;

    public void setParent(Node node);
    public Node getParent(); 

    public enum Status {
        DELETED, NOT_DELETED
    }
}
