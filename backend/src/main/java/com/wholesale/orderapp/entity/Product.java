package com.wholesale.orderapp.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name; // Product Name
    
    @Column(name = "hsn_code")
    private String hsnCode; // HSN code
    
    @Column(name = "net_rate", nullable = false)
    private Double netRate; // Net Rate (inclusive of tax)
    
    @Column(name = "tax_gst", nullable = false)
    private Double taxGst; // Tax (GST %)
    
    // Automatically computed extra columns
    @Column(name = "rate")
    private Double rate; // Rate reduced in net rate after tax
    
    @Column(name = "cgst_percent")
    private Double cgstPercent; // CGST percentage (GST / 2)
    
    @Column(name = "sgst_percent")
    private Double sgstPercent; // SGST percentage (GST / 2)
    
    @Column(name = "cgst_amount")
    private Double cgstAmount; // CGST value in currency
    
    @Column(name = "sgst_amount")
    private Double sgstAmount; // SGST value in currency
    
    @Column(name = "tax_amount")
    private Double taxAmount; // Total GST amount in currency

    @PrePersist
    @PreUpdate
    public void calculateTaxFields() {
        if (taxGst == null) {
            taxGst = 0.0;
        }
        if (netRate == null) {
            netRate = 0.0;
        }

        // Reverse Tax formula (Invoice GST standard): Rate = Net Rate / (1 + GST%)
        double divisor = 1.0 + (taxGst / 100.0);
        double calculatedRate = divisor > 0 ? (netRate / divisor) : netRate;
        this.rate = Math.round(calculatedRate * 100.0) / 100.0;

        double calculatedTax = netRate - this.rate;
        this.taxAmount = Math.round(calculatedTax * 100.0) / 100.0;

        this.cgstPercent = Math.round((taxGst / 2.0) * 100.0) / 100.0;
        this.sgstPercent = Math.round((taxGst / 2.0) * 100.0) / 100.0;

        double halfTax = this.taxAmount / 2.0;
        this.cgstAmount = Math.round(halfTax * 100.0) / 100.0;
        this.sgstAmount = Math.round((this.taxAmount - this.cgstAmount) * 100.0) / 100.0;
    }
}
