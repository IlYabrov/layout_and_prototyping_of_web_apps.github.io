<?php

if (!function_exists('calculateOrderTotal')) {
    function calculateOrderTotal(
        $service_type,
        array $order,
        array $bill,
        array $services,
        array $cars,
        array $preparation,
        array $additionalOptions,
        array $prep_keys
    ) {
        $result = [
            'car_name' => '',
            'selectedPrepNames' => [],
            'total' => 0,
            'days' => 0,
            'leaseRentTotal' => 0,
        ];

        if ($service_type === '' || !isset($services[$service_type], $cars[$service_type], $preparation[$service_type])) {
            return $result;
        }

        $basePrice = (int)$services[$service_type];
        $carKeys = array_keys($cars[$service_type]);
        $carIndex = isset($bill['car']) ? (int)$bill['car'] : 0;
        if (!isset($carKeys[$carIndex])) {
            $carIndex = 0;
        }

        $carName = $carKeys[$carIndex];
        $carPrice = (int)$cars[$service_type][$carName];

        $optionsTotal = 0;
        foreach (($order['options'] ?? []) as $opt) {
            if (isset($additionalOptions[$opt])) {
                $optionsTotal += (int)$additionalOptions[$opt];
            }
        }

        $prepTotal = 0;
        $selectedPrepNames = [];
        $prepList = array_keys($preparation[$service_type]);
        for ($i = 0; $i < 3; $i++) {
            if (!empty($bill[$prep_keys[$i]]) && isset($prepList[$i])) {
                $name = $prepList[$i];
                $selectedPrepNames[] = $name;
                $prepTotal += (int)$preparation[$service_type][$name];
            }
        }

        $days = ($service_type === 'продажа') ? 0 : (int)($bill['days'] ?? 0);
        $leaseRentTotal = ($service_type === 'прокат' || $service_type === 'лизинг') ? $basePrice * $days : 0;

        $total = ($service_type === 'продажа')
            ? ($basePrice + $carPrice + $optionsTotal + $prepTotal)
            : ($leaseRentTotal + $carPrice + $optionsTotal + $prepTotal);

        $result['car_name'] = $carName;
        $result['selectedPrepNames'] = $selectedPrepNames;
        $result['total'] = $total;
        $result['days'] = $days;
        $result['leaseRentTotal'] = $leaseRentTotal;

        return $result;
    }
}

