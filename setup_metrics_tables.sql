-- Create daily_order_metrics table
CREATE TABLE IF NOT EXISTS public.daily_order_metrics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_orders INTEGER NOT NULL DEFAULT 0,
    orders_target INTEGER NOT NULL DEFAULT 0,
    achieved_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00
);

-- Create monthly_order_metrics table
CREATE TABLE IF NOT EXISTS public.monthly_order_metrics (
    id SERIAL PRIMARY KEY,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    total_orders INTEGER NOT NULL DEFAULT 0,
    orders_target INTEGER NOT NULL DEFAULT 0,
    achieved_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    UNIQUE(month, year)
);

-- Create metrics table for general metrics
CREATE TABLE IF NOT EXISTS public.metrics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(50),
    UNIQUE(name, date)
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    vehicle_type VARCHAR(50) NOT NULL,
    joining_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create accounting_entries table
CREATE TABLE IF NOT EXISTS public.accounting_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('payment', 'receipt')),
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'bank', 'other')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample data for testing
INSERT INTO public.daily_order_metrics (date, total_orders, orders_target, achieved_percentage)
VALUES 
    (CURRENT_DATE, 85, 100, 85.00),
    (CURRENT_DATE - INTERVAL '1 day', 95, 100, 95.00),
    (CURRENT_DATE - INTERVAL '2 days', 105, 100, 105.00);

INSERT INTO public.monthly_order_metrics (month, year, total_orders, orders_target, achieved_percentage)
VALUES 
    (EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, 
     EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
     2450, 3000, 81.67),
    (EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')::INTEGER,
     EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')::INTEGER,
     2800, 3000, 93.33);

-- Add some sample metrics
INSERT INTO public.metrics (name, value, category)
VALUES 
    ('total_revenue', 25000.00, 'financial'),
    ('average_delivery_time', 28.5, 'performance'),
    ('customer_satisfaction', 4.8, 'satisfaction');

-- Add sample drivers
INSERT INTO public.drivers (full_name, email, phone, vehicle_type, joining_date)
VALUES 
    ('John Doe', 'john.doe@example.com', '+1234567890', 'Truck', '2023-01-15'),
    ('Jane Smith', 'jane.smith@example.com', '+1987654321', 'Van', '2023-02-20'),
    ('Mike Johnson', 'mike.johnson@example.com', '+1122334455', 'Car', '2023-03-10');

-- Add sample accounting entries
INSERT INTO public.accounting_entries (date, type, amount, category, description, payment_method, status)
VALUES
    (CURRENT_DATE, 'payment', 1500.00, 'Salary', 'Monthly salary payment for John Doe', 'bank', 'completed'),
    (CURRENT_DATE, 'payment', 500.00, 'Fuel', 'Fuel expenses for delivery trucks', 'cash', 'completed'),
    (CURRENT_DATE - INTERVAL '1 day', 'payment', 200.00, 'Office Supplies', 'Office stationery and supplies', 'cash', 'completed');
