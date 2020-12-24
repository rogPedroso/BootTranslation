package com.pevolu.ingles;

import java.util.Objects;
import org.springframework.data.annotation.Id;

import javax.persistence.Version;

import com.fasterxml.jackson.annotation.JsonIgnore;

//import javax.persistence.Entity;
//import javax.persistence.GeneratedValue;
//import javax.persistence.Id;


public class Teste {

	@Id
	public String id;

    public int execucao;
    public int respostas;
    public int acertos;
    public int erros;

	public Teste() {}

	public Teste(int execucao, int respostas, int acertos, int erros) {
        this.execucao = execucao;
        this.respostas = respostas;
        this.acertos = acertos;
        this.erros = erros;
    }
    
    public String getId() {
        return this.id;
    }
/*
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
*/


/*
	@Override
	public String toString() {
		return String.format(
				"Customer[id=%s, firstName='%s', lastName='%s']",
				id, exppt, lastName);
	}
*/
}

