package com.pevolu.ingles;

import org.springframework.data.annotation.Id;

//import javax.persistence.Entity;
//import javax.persistence.GeneratedValue;
//import javax.persistence.Id;


public class Translation {

	@Id
	public String id;

    public String exppt;
    public String expen;
    public String frasept;
    public String fraseen;
    public boolean respondido;
    public boolean acerto;

	public Translation() {}

	public Translation(String exppt, String expen, String frasept, String fraseen, boolean respondido, boolean acerto) {
        this.exppt = exppt;
        this.expen = expen;
        this.frasept = frasept;
        this.fraseen = fraseen;
        this.respondido = respondido;
        this.acerto = acerto;
    }
    
    public String getId() {
        return this.id;
    }
/*
	@Override
	public String toString() {
		return String.format(
				"Customer[id=%s, firstName='%s', lastName='%s']",
				id, exppt, lastName);
	}
*/
}

