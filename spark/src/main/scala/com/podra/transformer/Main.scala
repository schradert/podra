package com.podra

object Utils {
    @specialized def discard[A](evaluateForSideEffectOnly: A): Unit = {
        val _: A = evaluateForSideEffectOnly
        ()
    }
}