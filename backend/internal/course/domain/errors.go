package domain

import "errors"

var (
	ErrNotFound           = errors.New("course not found")
	ErrUniversityNotFound = errors.New("university not found or not visible")
	ErrEnterpriseNotFound = errors.New("enterprise not found")
	ErrSlugTaken          = errors.New("course slug already used in this university")
	ErrForbidden          = errors.New("not allowed")
	ErrUnknownField       = errors.New("unknown private field")
	ErrInvalid            = errors.New("invalid input")
)


