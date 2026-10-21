package com.example.demo.controller;

import com.example.demo.entity.Ride;
import com.example.demo.entity.Driver;
import com.example.demo.entity.RideStatus;
import com.example.demo.entity.Customer;
import com.example.demo.repository.RideRepository;
import com.example.demo.repository.DriverRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.service.FareCalculationService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;
    private final CustomerRepository customerRepository;
    private final FareCalculationService fareCalculationService;

    public RideController(
            RideRepository rideRepository,
            DriverRepository driverRepository,
            CustomerRepository customerRepository,
            FareCalculationService fareCalculationService) {

        this.rideRepository = rideRepository;
        this.driverRepository = driverRepository;
        this.customerRepository = customerRepository;
        this.fareCalculationService = fareCalculationService;
    }

    // 1. Book a new ride
    @PostMapping
    public Ride bookRide(@RequestBody Ride ride) {

        if (ride.getDistanceInKm() == null ||
                ride.getDistanceInKm() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Distance must be greater than zero"
            );
        }

        Customer customer = customerRepository
                .findById(ride.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found!"
                ));

        Driver driver = driverRepository
                .findById(ride.getDriverId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Driver not found!"
                ));

        if (!driver.isAvailable()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Driver is not available!"
            );
        }

        boolean hasActiveRide =
                rideRepository.existsByDriverIdAndStatusIn(
                        driver.getId(),
                        List.of(
                                RideStatus.REQUESTED,
                                RideStatus.ACCEPTED,
                                RideStatus.IN_PROGRESS
                        )
                );

        if (hasActiveRide) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Driver already has an active ride!"
            );
        }

        double calculatedFare =
                fareCalculationService.calculateFare(
                        ride.getDistanceInKm()
                );

        ride.setFare(calculatedFare);

        return rideRepository.save(ride);
    }

    // 2. Get all rides
    @GetMapping
    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }

    // 3. Get ride by ID
    @GetMapping("/{id}")
    public Ride getRideById(@PathVariable Long id) {

        return rideRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ride not found!"
                ));
    }

    // 4. Get rides by customer ID
    @GetMapping("/customer/{customerId}")
    public List<Ride> getRidesByCustomerId(
            @PathVariable Long customerId) {

        return rideRepository.findByCustomerId(customerId);
    }

    // 5. Get rides by driver ID
    @GetMapping("/driver/{driverId}")
    public List<Ride> getRidesByDriverId(
            @PathVariable Long driverId) {

        return rideRepository.findByDriverId(driverId);
    }

    // 6. Update ride status
    @PutMapping("/{id}")
    public Ride updateRide(
            @PathVariable Long id,
            @RequestBody Ride updatedRide) {

        return rideRepository.findById(id)
                .map(ride -> {

                    RideStatus currentStatus = ride.getStatus();
                    RideStatus newStatus = updatedRide.getStatus();

                    if (currentStatus == RideStatus.COMPLETED ||
                            currentStatus == RideStatus.CANCELLED) {

                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Completed or cancelled ride cannot be updated!"
                        );
                    }
                    boolean validTransition =
                            (currentStatus == RideStatus.REQUESTED
                                    && (newStatus == RideStatus.ACCEPTED
                                    || newStatus == RideStatus.REJECTED
                                    || newStatus == RideStatus.CANCELLED))
                                    || (currentStatus == RideStatus.ACCEPTED
                                    && (newStatus == RideStatus.IN_PROGRESS
                                    || newStatus == RideStatus.CANCELLED))
                                    || (currentStatus == RideStatus.IN_PROGRESS
                                    && (newStatus == RideStatus.COMPLETED
                                    || newStatus == RideStatus.CANCELLED));

                    if (newStatus == null || !validTransition) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Invalid ride status transition!"
                        );
                    }

                    // Accept ride: check other active rides,
                    // excluding the ride currently being accepted.
                    if (newStatus == RideStatus.ACCEPTED) {

                        Driver driver = driverRepository
                                .findById(ride.getDriverId())
                                .orElseThrow(() -> new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Driver not found!"
                                ));

                        if (!driver.isAvailable()) {
                            throw new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Driver is not available!"
                            );
                        }

                        boolean hasOtherActiveRide =
                                rideRepository.findByDriverId(driver.getId())
                                        .stream()
                                        .anyMatch(otherRide ->
                                                !otherRide.getId().equals(ride.getId()) &&
                                                        (otherRide.getStatus() == RideStatus.REQUESTED ||
                                                                otherRide.getStatus() == RideStatus.ACCEPTED ||
                                                                otherRide.getStatus() == RideStatus.IN_PROGRESS)
                                        );

                        if (hasOtherActiveRide) {
                            throw new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Driver already has another active ride!"
                            );
                        }

                        driver.setAvailable(false);
                        driverRepository.save(driver);
                    }

                    // Complete or cancel ride: make driver available again.
                    if (newStatus == RideStatus.COMPLETED
                            || newStatus == RideStatus.CANCELLED
                            || newStatus == RideStatus.REJECTED) {

                        Driver driver = driverRepository
                                .findById(ride.getDriverId())
                                .orElseThrow(() -> new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Driver not found!"
                                ));

                        driver.setAvailable(true);
                        driverRepository.save(driver);
                    }

                    ride.setStatus(newStatus);

                    return rideRepository.save(ride);
                })
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ride not found!"
                ));
    }

    // 7. Delete ride by ID
    @DeleteMapping("/{id}")
    public String deleteRide(@PathVariable Long id) {

        if (!rideRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Ride not found!"
            );
        }

        rideRepository.deleteById(id);

        return "Ride deleted successfully!";
    }
}