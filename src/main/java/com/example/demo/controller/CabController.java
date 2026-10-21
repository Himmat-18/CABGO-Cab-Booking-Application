package com.example.demo.controller;

import com.example.demo.entity.Cab;
import com.example.demo.repository.CabRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;



import java.util.List;

@RestController
@RequestMapping("/api/cabs")
public class CabController {

    private final CabRepository cabRepository;

    public CabController(CabRepository cabRepository) {
        this.cabRepository = cabRepository;
    }

    // Register a new cab
    @PostMapping
    public Cab registerCab(@RequestBody Cab cab) {
        return cabRepository.save(cab);
    }

    // Get all cabs
    @GetMapping
    public List<Cab> getAllCabs() {
        return cabRepository.findAll();
    }
    // Get cab by ID
    @GetMapping("/{id}")
    public Cab getCabById(@PathVariable Long id) {
        return cabRepository.findById(id).orElse(null);
    }
    @PutMapping("/{id}")
    public Cab updateCab(
            @PathVariable Long id,
            @RequestBody Cab updatedCab) {

        return cabRepository.findById(id)
                .map(cab -> {
                    cab.setModel(updatedCab.getModel());
                    cab.setRegistrationNumber(
                            updatedCab.getRegistrationNumber());
                    cab.setColor(updatedCab.getColor());
                    cab.setAvailable(updatedCab.isAvailable());

                    return cabRepository.save(cab);
                })
                .orElse(null);
    }
    @DeleteMapping("/{id}")
    public String deleteCab(@PathVariable Long id) {

        if (!cabRepository.existsById(id)) {
            return "Cab not found!";
        }

        cabRepository.deleteById(id);
        return "Cab deleted successfully!";
    }
}