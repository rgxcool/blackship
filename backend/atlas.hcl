variable "database_url" {
  type    = string
  default = "postgres://postgres:postgres@localhost:5433/centralize_directory?sslmode=disable"
}

env "local" {
  src = "file://schema"
  url = var.database_url
  dev = "docker://postgres/18/dev?search_path=public"

  migration {
    dir = "file://migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}