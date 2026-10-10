package com.wholesale.orderapp.controller;

import com.wholesale.orderapp.entity.City;
import com.wholesale.orderapp.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
@CrossOrigin(origins = "*")
public class CityController {

    @Autowired
    private CityRepository cityRepository;

    @GetMapping
    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    @PostMapping
    public City createCity(@RequestBody City city) {
        return cityRepository.save(city);
    }
    
    @DeleteMapping("/{id}")
    public void deleteCity(@PathVariable Long id) {
        cityRepository.deleteById(id);
    }
}
