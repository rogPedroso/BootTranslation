package com.pevolu.ingles;

import java.util.Objects;
import org.springframework.data.annotation.Id;

import javax.persistence.Version;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

	public @Version @JsonIgnore Long version;

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

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Translation translation = (Translation) o;
		return Objects.equals(id, translation.id) &&
			Objects.equals(exppt, translation.exppt) &&
			Objects.equals(expen, translation.expen) &&
			Objects.equals(frasept, translation.frasept) &&
			Objects.equals(fraseen, translation.fraseen) &&
			Objects.equals(respondido, translation.respondido) &&
			Objects.equals(acerto, translation.acerto) &&
			Objects.equals(version, translation.version);
	}

	@Override
	public int hashCode() {

		return Objects.hash(id, exppt, expen, frasept, fraseen, respondido, acerto, version);
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

