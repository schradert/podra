
package com.podra.types;

public enum Status {
    SUCCESS, FAILURE;
}

public class Comment {

	private String value;
    private Status status;

	public Comment() {
        this.value = "";
        this.success = true;
	}

	public Comment(String value) {
		this.value = value;
        this.success = true;
	}

	public String getValue() {
		return this.value;
	}

	public void setValue(String value) {
		this.value = value;
	}

    public boolean isFailure() {
        return this.status == Status.FAILURE;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

	@Override
	public String toString() {
		return "Comment [value=" + this.value + ", status=" + this.status + "]";
	}

}