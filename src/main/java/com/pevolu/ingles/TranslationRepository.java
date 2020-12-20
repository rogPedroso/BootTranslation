package com.pevolu.ingles;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

//public interface TranslationRepository extends MongoRepository<Translation, String> {

public interface TranslationRepository extends MongoRepository<Translation, String>, PagingAndSortingRepository<Translation, String> {

    public List<Translation> findAll();

}
