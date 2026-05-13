from django.db import models


class Gender(models.Model):
    name = models.CharField(max_length=50, unique=True)


class MaritalStatus(models.Model):
    name = models.CharField(max_length=50, unique=True)


class Specialty(models.Model):
    name = models.CharField(max_length=50, unique=True)


class HealthAssistantCooperationType(models.Model):
    name = models.CharField(max_length=50, unique=True)


class Education(models.Model):
    name = models.CharField(max_length=50, unique=True)


class JobStatus(models.Model):
    name = models.CharField(max_length=50, unique=True)


class HousingStatus(models.Model):
    name = models.CharField(max_length=50, unique=True)


class CoveredOrganization(models.Model):
    name = models.CharField(max_length=50, unique=True)


class Insurance(models.Model):
    name = models.CharField(max_length=50, unique=True)


class OrganizationType(models.Model):
    name = models.CharField(max_length=50, unique=True)
