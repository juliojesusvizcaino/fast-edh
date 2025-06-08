import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
	'https://dtispnwtizynymgnneda.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aXNwbnd0aXp5bnltZ25uZWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxODU0OTcsImV4cCI6MjA2Mzc2MTQ5N30.lffDUIhgpIIn2zGxP_95qcETi8yi3BDUdprrcNif7bY'
);
