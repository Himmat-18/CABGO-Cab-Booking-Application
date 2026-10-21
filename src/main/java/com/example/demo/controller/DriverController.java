package com.example.demo.controller;

import com.example.demo.entity.Driver;
import com.example.demo.repository.DriverRepository;

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
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverRepository driverRepository;

    public DriverController(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    // Register a new driver
    @PostMapping
    public Driver registerDriver(@RequestBody Driver driver) {
        return driverRepository.save(driver);
    }

    // Get all drivers
    @GetMapping
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }
    // Get driver by ID
    @GetMapping("/{id}")
    public Driver getDriverById(@PathVariable Long id) {
        return driverRepository.findById(id).orElse(null);
    }
    // Update driver by ID
    @PutMapping("/{id}")
    public Driver updateDriver(
            @PathVariable Long id,
            @RequestBody Driver updatedDriver) {

        return driverRepository.findById(id)
                .map(driver -> {
                    driver.setName(updatedDriver.getName());
                    driver.setPhone(updatedDriver.getPhone());
                    driver.setLicenseNumber(updatedDriver.getLicenseNumber());
                    driver.setAvailable(updatedDriver.isAvailable());

                    return driverRepository.save(driver);
                })
                .orElse(null);
    }
    // Delete driver by ID
    @DeleteMapping("/{id}")
    public String deleteDriver(@PathVariable Long id) {

        if (!driverRepository.existsById(id)) {
            return "Driver not found!";
        }

        driverRepository.deleteById(id);
        return "Driver deleted successfully!";
    }
}