package com.pevolu.ingles;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

//public interface TranslationRepository extends MongoRepository<Translation, String> {

public interface TesteRepository extends MongoRepository<Teste, String>, PagingAndSortingRepository<Teste, String> {

    public List<Teste> findAll();
    public Teste findFirstByOrderByExecucaoDesc();

}
