# from django.db import models
#
# from .user import CustomUser
#
#
# class SocialWorkUnit(models.Model):
#     user = models.OneToOneField(
#         CustomUser,
#         on_delete=models.CASCADE,
#         related_name="social_work_unit_profile",
#     )
#
#     organization_type = models.CharField(
#         max_length=100,
#         help_text="e.g. hospital, government_org, private_company, association",
#     )
#
#     subset_type = models.CharField(max_length=100)
#
#     subset_name = models.CharField(max_length=200)
#
#     organization_head_name = models.CharField(max_length=200)
#
#     organization_head_mobile = models.CharField(max_length=11)
#
#     phone_city_code = models.CharField(max_length=10)
#
#     phone_number = models.CharField(max_length=20)
#
#     fax_number = models.CharField(max_length=20, blank=True)
#
#     province = models.CharField(max_length=100)
#     county = models.CharField(max_length=100)
#     city = models.CharField(max_length=100)
#     address = models.TextField()
#
#     sharable_facilities = models.TextField(
#         help_text="Facilities or services the organization can share",
#     )
#
#     social_unit_head_name = models.CharField(max_length=200)
#
#     social_unit_head_phone = models.CharField(max_length=20)
#
#     social_unit_head_mobile = models.CharField(max_length=11)
#
#     membership_request_letter = models.FileField(
#         upload_to="social_units/letters/",
#     )
#
#     logo = models.ImageField(
#         upload_to="social_units/logos/",
#         blank=True,
#         null=True,
#     )
#
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return self.subset_name
