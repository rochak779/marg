-- Curriculum now has 6 modules (Module 1: How Software Actually Works was
-- inserted ahead of the previous five, which shifted ids 1-5 -> 2-6). Widen
-- the module_id range this table accepts to match.
alter table public.learning_path_modules
  drop constraint learning_path_modules_module_id_check,
  add constraint learning_path_modules_module_id_check
    check (module_id between 1 and 6);
