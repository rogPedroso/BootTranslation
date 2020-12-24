package com.pevolu.ingles;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

@SpringBootApplication
@RestController
@RequestMapping(value="translation")
public class TranslationApplication {

	@Autowired
	private TranslationRepository repository;

	@Autowired
	private TesteRepository testeRepository;

	public static void main(String[] args) {
		SpringApplication.run(TranslationApplication.class, args);
	}

	@CrossOrigin(origins = "http://192.168.0.11:3000")
	@RequestMapping(value="/list",method = RequestMethod.GET)
    public List<Translation> list() {
        return repository.findAll();
    }

	@RequestMapping(value="/contatestes",method = RequestMethod.GET)
    public Teste contaTestes() {
		Teste teste;
		List<Teste> listTeste = testeRepository.findAll();
		if (listTeste.size() > 0) {
			teste = testeRepository.findFirstByOrderByExecucaoDesc();
		} else {
			teste = new Teste (1, 0, 0, 0);
			testeRepository.save(teste);
		}
        return teste;
    }

	
	@RequestMapping(value="/umnaorespondido",method = RequestMethod.GET)
    public Translation umNaoRespondido() {
		Translation transl;
		List<Translation> listTransl = repository.findByRespondido(false);
		if (listTransl.size() > 0) {
			Collections.shuffle(listTransl);
			transl = listTransl.get(1);
		} else {
			ArrayList<Translation> arrayTransl = new ArrayList(repository.findAll());
			arrayTransl.forEach(t -> resetResp(t));
			repository.saveAll(arrayTransl);
			Collections.shuffle(arrayTransl);
			transl = arrayTransl.get(1);
			Teste ultimoTeste = contaTestes();
			Teste novoTeste = new Teste(ultimoTeste.execucao + 1, 0, 0, 0);
			testeRepository.save(novoTeste);
		}
        return transl;
    }
	/*
	@RequestMapping(value="/umnaorespondido",method = RequestMethod.GET)
    public Translation umNaoRespondido() {
        return repository.findByExppt("Livro");
    }
	*/

	private static void resetResp(Translation transl) {
		transl.respondido = false;
		transl.acerto = false;
    }


	@RequestMapping(value="/respondido",method = RequestMethod.GET)
    public List<Translation> respondido() {
        return repository.findByRespondido(true);
    }

	@RequestMapping(value="/busca/{exppt}",method = RequestMethod.GET)
    public Translation buscaExppt( @PathVariable("exppt") String exppt) {
		Translation transl = repository.findByExppt(exppt);
        return transl;
    }

	@RequestMapping(value="/buscaId/{id}",method = RequestMethod.GET)
    public Optional buscaId( @PathVariable("id") String id) {
        return repository.findById(id);
    }

	@PutMapping("/teste/{id}")
	Translation replaceTranslation(@RequestBody Translation newTranslation, @PathVariable String id) {
		return repository.findById(id)
		.map(translation -> {
			translation.exppt = newTranslation.exppt;
			translation.expen = newTranslation.expen;
			translation.frasept = newTranslation.frasept;
			translation.fraseen = newTranslation.fraseen;
			translation.respondido = newTranslation.respondido;
			translation.acerto = newTranslation.acerto;
			Teste ultimoTeste = contaTestes();
			ultimoTeste.respostas = ultimoTeste.respostas + 1;
			if (newTranslation.acerto) {
				ultimoTeste.acertos = ultimoTeste.acertos + 1;
			} else {
				ultimoTeste.erros = ultimoTeste.erros + 1;
			}
			testeRepository.save(ultimoTeste);
			return repository.save(translation);
		})
		.orElseGet(() -> {
			newTranslation.id = id;
			return repository.save(newTranslation);
		});
	}

}