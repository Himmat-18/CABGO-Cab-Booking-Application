package com.example.demo.service;

import org.springframework.stereotype.Service;

@Service
public class FareCalculationService {

    private static final double BASE_FARE = 50.0;
    private static final double PER_KM_RATE = 12.0;

    public double calculateFare(double distanceInKm) {

        if (distanceInKm <= 0) {
            throw new IllegalArgumentException(
                    "Distance must be greater than zero"
            );
        }

        double fare = BASE_FARE + (distanceInKm * PER_KM_RATE);

        return Math.round(fare * 100.0) / 100.0;
    }

}